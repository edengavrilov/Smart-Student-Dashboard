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
    public class ScheduleController : ControllerBase
    {
        private readonly DashboardContext _context;

        public ScheduleController(DashboardContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleItem>>> GetScheduleItems()
        {
            var userId = GetUserId();
            return await _context.ScheduleItems.Where(s => s.UserId == userId).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleItem>> GetScheduleItem(int id)
        {
            var userId = GetUserId();
            var item = await _context.ScheduleItems.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<ScheduleItem>> PostScheduleItem(ScheduleItem item)
        {
            item.UserId = GetUserId();
            _context.ScheduleItems.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetScheduleItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutScheduleItem(int id, ScheduleItem item)
        {
            var userId = GetUserId();
            if (id != item.Id) return BadRequest();
            if (!await _context.ScheduleItems.AnyAsync(s => s.Id == id && s.UserId == userId))
                return NotFound();
            item.UserId = userId;
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScheduleItem(int id)
        {
            var userId = GetUserId();
            var item = await _context.ScheduleItems.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
            if (item == null) return NotFound();
            _context.ScheduleItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}