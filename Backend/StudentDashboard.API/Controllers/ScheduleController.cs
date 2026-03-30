using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentDashboard.API.Data;
using StudentDashboard.API.Models;
using System.Threading.Tasks;

namespace StudentDashboard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly DashboardContext _context;
        public ScheduleController(DashboardContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleItem>>> GetScheduleItems()
        {
            return await _context.ScheduleItems.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleItem>> GetScheduleItem(int id)
        {
            var item = await _context.ScheduleItems.FindAsync(id);
            if(item == null)
                return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<ScheduleItem>> PostScheduleItems(ScheduleItem item)
        {
            _context.ScheduleItems.Add(item);
            await _context.SaveChangesAsync();  
            return CreatedAtAction(nameof(GetScheduleItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutScheduleItem(int id, ScheduleItem item)
        {
            if(id !=item.Id) { return BadRequest(); }

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }

            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ScheduleItems.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScheduleItem(int id)
        {
            var item = await _context.ScheduleItems.FindAsync(id);

            if (item == null) { return NotFound(); }

            _context.ScheduleItems.Remove(item);

            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
