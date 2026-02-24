using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentDashboard.API.Data;
using StudentDashboard.API.Models;

namespace StudentDashboard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly DashboardContext _context;
        public TasksController(DashboardContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentTask>>> GetTasks()  //get list of student tasks
        {
            return await _context.StudentTasks.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<StudentTask>> PostTask(StudentTask task)
        {
            _context.StudentTasks.Add(task);
            await _context.SaveChangesAsync();  //turn to INSERT INTO DB
            return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, StudentTask task) //edit task
        {
            if(id !=task.Id)
            {
                return BadRequest();
            }

            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }

            catch (DbUpdateConcurrencyException)
            {
                if(!_context.StudentTasks.Any(e=> e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.StudentTasks.FindAsync(id);

            if (task == null) { return NotFound(); }

            _context.StudentTasks.Remove(task);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
