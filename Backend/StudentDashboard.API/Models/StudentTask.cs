namespace StudentDashboard.API.Models
{
    public class StudentTask
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public int Priority { get; set; } = 1;       // 0=Low, 1=Medium, 2=High
        public string Category { get; set; } = "Studies"; // Studies | Personal | Work
    }
}
