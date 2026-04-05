using System.ComponentModel.DataAnnotations;

namespace StudentDashboard.API.Models
{
    public class GradeComponent
    {
        public int Id { get; set; }

        public int GradeId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = "";

        public double Weight { get; set; }

        public double? Score { get; set; }
    }
}
