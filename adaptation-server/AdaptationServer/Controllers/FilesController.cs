using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api")]
public class FilesController : ControllerBase
{
    [HttpPost("files/upload")]
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string folder = "slides")
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is required");

        // Проверка типа файла
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("File type not allowed");

        // Проверка размера файла (например, максимум 10MB)
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("File size exceeds the limit");

        // Создаем безопасное имя файла
        var fileName = $"image-{DateTime.Now.Ticks}{Path.GetExtension(file.FileName)}";

        // Создаем путь для сохранения файла
        var folderPath = Path.Combine("uploads", folder);
        Directory.CreateDirectory(folderPath);

        var filePath = Path.Combine(folderPath, fileName);

        try
        {
            // Сохраняем файл
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Формируем URL для доступа к файлу
            var fileUrl = $"api/uploads/{folder}/{fileName}";

            return Ok(new
            {
                url = fileUrl,
                fileName = fileName,
                mimeType = file.ContentType,
                size = file.Length,
                folder = folder
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("uploads/{folder}/{file}")]
    public IActionResult Download(string folder, string file)
    {

        var folderPath = Path.Combine("uploads", folder);
        var filePath = Path.Combine(folderPath, file);

        return File(System.IO.File.ReadAllBytes(filePath), "image/jpg");
    }
}