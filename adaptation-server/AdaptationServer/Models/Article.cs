using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace AdaptationServer.Models;

public class Article
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Category { get; set; } = null!;
    [Column(TypeName = "jsonb")]
    public List<string> Tags { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Author { get; set; } = null!;
    public Guid CompanyProfileId { get; set; }
    
    public CompanyProfile CompanyProfile { get; set; } = null!;
}