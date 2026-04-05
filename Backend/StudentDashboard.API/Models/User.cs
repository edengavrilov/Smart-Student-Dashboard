using System.ComponentModel.DataAnnotations;

namespace StudentDashboard.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string Institution { get; set; } = "";

        [MaxLength(20)]
        public string StudyYear { get; set; } = "";

        [MaxLength(100)]
        public string FieldOfStudy { get; set; } = "";
    }
}
