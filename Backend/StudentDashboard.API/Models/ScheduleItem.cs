using System.ComponentModel.DataAnnotations;

namespace StudentDashboard.API.Models
{
    public class ScheduleItem
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CourseName { get; set; }
        
        [MaxLength(100)]
        public string Instructor { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        [MaxLength(100)]
        public string Location { get; set; }

        [MaxLength(20)]
        public string Color { get; set; }

        [MaxLength(20)]
        public string Semester { get; set; }
    }
}