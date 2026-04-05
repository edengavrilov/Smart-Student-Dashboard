using System.ComponentModel.DataAnnotations;

namespace StudentDashboard.API.Models
{
    public class Grade
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string CourseName { get; set; } = "";

        public int Credits { get; set; }

        [MaxLength(20)]
        public string Semester { get; set; } = "";

        [MaxLength(20)]
        public string Year { get; set; } = "";

        public double? FinalScore { get; set; }

        public int UserId { get; set; }

        public ICollection<GradeComponent> Components { get; set; } = new List<GradeComponent>();
    }
}
