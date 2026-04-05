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
    public class GradesController : ControllerBase
    {
        private readonly DashboardContext _context;

        public GradesController(DashboardContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<ActionResult> GetGrades()
        {
            var userId = GetUserId();
            var grades = await _context.Grades
                .Where(g => g.UserId == userId)
                .Include(g => g.Components)
                .OrderBy(g => g.Year)
                .ThenBy(g => g.Semester)
                .ThenBy(g => g.CourseName)
                .Select(g => new
                {
                    g.Id,
                    g.CourseName,
                    g.Credits,
                    g.Semester,
                    g.Year,
                    g.FinalScore,
                    Components = g.Components.Select(c => new
                    {
                        c.Id,
                        c.GradeId,
                        c.Name,
                        c.Weight,
                        c.Score
                    }).ToList()
                })
                .ToListAsync();

            return Ok(grades);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetGrade(int id)
        {
            var userId = GetUserId();
            var grade = await _context.Grades
                .Where(g => g.Id == id && g.UserId == userId)
                .Include(g => g.Components)
                .Select(g => new
                {
                    g.Id,
                    g.CourseName,
                    g.Credits,
                    g.Semester,
                    g.Year,
                    g.FinalScore,
                    Components = g.Components.Select(c => new
                    {
                        c.Id,
                        c.GradeId,
                        c.Name,
                        c.Weight,
                        c.Score
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (grade == null) return NotFound();
            return Ok(grade);
        }

        [HttpPost]
        public async Task<ActionResult> PostGrade([FromBody] GradeDto dto)
        {
            var grade = new Grade
            {
                CourseName = dto.CourseName,
                Credits = dto.Credits,
                Semester = dto.Semester,
                Year = dto.Year,
                FinalScore = dto.FinalScore,
                UserId = GetUserId()
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

            foreach (var comp in dto.Components)
            {
                _context.GradeComponents.Add(new GradeComponent
                {
                    GradeId = grade.Id,
                    Name = comp.Name,
                    Weight = comp.Weight,
                    Score = comp.Score
                });
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGrade), new { id = grade.Id }, new { grade.Id });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> PutGrade(int id, [FromBody] GradeDto dto)
        {
            var userId = GetUserId();
            var grade = await _context.Grades
                .Include(g => g.Components)
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (grade == null) return NotFound();

            grade.CourseName = dto.CourseName;
            grade.Credits = dto.Credits;
            grade.Semester = dto.Semester;
            grade.Year = dto.Year;
            grade.FinalScore = dto.FinalScore;

            _context.GradeComponents.RemoveRange(grade.Components);

            foreach (var comp in dto.Components)
            {
                grade.Components.Add(new GradeComponent
                {
                    GradeId = grade.Id,
                    Name = comp.Name,
                    Weight = comp.Weight,
                    Score = comp.Score
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGrade(int id)
        {
            var userId = GetUserId();
            var grade = await _context.Grades
                .Include(g => g.Components)
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (grade == null) return NotFound();

            _context.GradeComponents.RemoveRange(grade.Components);
            _context.Grades.Remove(grade);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("average")]
        public async Task<ActionResult> GetAverage()
        {
            var userId = GetUserId();
            var grades = await _context.Grades
                .Where(g => g.UserId == userId)
                .ToListAsync();

            var graded = grades.Where(g => g.FinalScore.HasValue).ToList();
            int totalCredits = grades.Sum(g => g.Credits);
            int gradedCredits = graded.Sum(g => g.Credits);

            double? average = null;
            if (gradedCredits > 0)
                average = Math.Round(graded.Sum(g => g.FinalScore!.Value * g.Credits) / gradedCredits, 2);

            return Ok(new { average, totalCredits, gradedCredits });
        }

        [HttpPost("predict")]
        public async Task<ActionResult> Predict([FromBody] PredictDto dto)
        {
            var userId = GetUserId();
            var grades = await _context.Grades
                .Where(g => g.UserId == userId)
                .ToListAsync();

            if (!grades.Any())
                return Ok(new { requiredScore = (double?)null, message = "noCourses" });

            var graded = grades.Where(g => g.FinalScore.HasValue).ToList();
            var ungraded = grades.Where(g => !g.FinalScore.HasValue).ToList();

            double gradedWeightedSum = graded.Sum(g => g.FinalScore!.Value * g.Credits);
            int gradedCredits = graded.Sum(g => g.Credits);
            int ungradedCredits = ungraded.Sum(g => g.Credits);
            int totalCredits = gradedCredits + ungradedCredits;

            double? currentAverage = gradedCredits > 0
                ? Math.Round(gradedWeightedSum / gradedCredits, 2)
                : null;

            if (totalCredits == 0)
                return Ok(new { requiredScore = (double?)null, currentAverage });

            if (ungradedCredits == 0)
                return Ok(new
                {
                    requiredScore = (double?)null,
                    currentAverage,
                    ungradedCourses = new List<string>(),
                    message = "allGraded"
                });

            double required = Math.Round(
                (dto.TargetAverage * totalCredits - gradedWeightedSum) / ungradedCredits, 2);

            return Ok(new
            {
                requiredScore = required,
                currentAverage,
                ungradedCourses = ungraded.Select(g => g.CourseName).ToList(),
                totalCredits,
                gradedCredits
            });
        }
    }

    public class GradeDto
    {
        public string CourseName { get; set; } = "";
        public int Credits { get; set; }
        public string Semester { get; set; } = "";
        public string Year { get; set; } = "";
        public double? FinalScore { get; set; }
        public List<ComponentDto> Components { get; set; } = new();
    }

    public class ComponentDto
    {
        public string Name { get; set; } = "";
        public double Weight { get; set; }
        public double? Score { get; set; }
    }

    public class PredictDto
    {
        public double TargetAverage { get; set; }
    }
}
