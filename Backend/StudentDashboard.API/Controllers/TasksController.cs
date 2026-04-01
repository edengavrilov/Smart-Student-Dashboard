using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentDashboard.API.Data;
using StudentDashboard.API.Models;
using System.Security.Claims;

namespace StudentDashboard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly DashboardContext _context;

        public TasksController(DashboardContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentTask>>> GetTasks()
        {
            var userId = GetUserId();
            return await _context.StudentTasks.Where(t => t.UserId == userId).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentTask>> GetTask(int id)
        {
            var userId = GetUserId();
            var task = await _context.StudentTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound();
            return task;
        }

        [HttpPost]
        public async Task<ActionResult<StudentTask>> PostTask(StudentTask task)
        {
            task.UserId = GetUserId();
            _context.StudentTasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, StudentTask task)
        {
            var userId = GetUserId();
            if (id != task.Id) return BadRequest();
            if (!await _context.StudentTasks.AnyAsync(t => t.Id == id && t.UserId == userId))
                return NotFound();
            task.UserId = userId;
            _context.Entry(task).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = GetUserId();
            var task = await _context.StudentTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound();
            _context.StudentTasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}