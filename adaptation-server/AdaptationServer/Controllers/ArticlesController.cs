using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ArticlesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ArticlesController(ApplicationDbContext context)
    {
        _context = context;
    }

    private async Task<(Guid userId, Guid? companyId)> GetUserAndCompanyId()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        return (userId, user?.CurrentCompanyId);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        return await _context.Articles
            .Where(a => a.CompanyProfileId == companyId.Value)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> GetArticle(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var article = await _context.Articles
            .FirstOrDefaultAsync(a => a.Id == id && a.CompanyProfileId == companyId.Value);

        if (article == null)
        {
            return NotFound(new { message = "Article not found" });
        }

        return article;
    }

    [HttpPost]
    public async Task<ActionResult<Article>> CreateArticle([FromBody] CreateArticleRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var article = new Article
        {
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            Tags = request.Tags,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Author = request.Author,
            CompanyProfileId = companyId.Value
        };

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(Guid id, [FromBody] Article article)
    {
        if (id != article.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var existingArticle = await _context.Articles
            .FirstOrDefaultAsync(a => a.Id == id && a.CompanyProfileId == companyId.Value);

        if (existingArticle == null)
        {
            return NotFound(new { message = "Article not found" });
        }

        existingArticle.Title = article.Title;
        existingArticle.Content = article.Content;
        existingArticle.Category = article.Category;
        existingArticle.Tags = article.Tags;
        existingArticle.UpdatedAt = DateTime.UtcNow;
        existingArticle.Author = article.Author;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ArticleExistsInCompany(id, companyId.Value))
            {
                return NotFound(new { message = "Article not found" });
            }
            throw;
        }

        return Ok(existingArticle);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var article = await _context.Articles
            .FirstOrDefaultAsync(a => a.Id == id && a.CompanyProfileId == companyId.Value);

        if (article == null)
        {
            return NotFound(new { message = "Article not found" });
        }

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> ArticleExistsInCompany(Guid id, Guid companyId)
    {
        return await _context.Articles.AnyAsync(a => a.Id == id && a.CompanyProfileId == companyId);
    }
}

public class CreateArticleRequest
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Category { get; set; } = null!;
    public List<string> Tags { get; set; } = [];
    public string Author { get; set; } = null!;
}
