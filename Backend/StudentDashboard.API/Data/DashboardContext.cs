using Microsoft.EntityFrameworkCore;
using StudentDashboard.API.Models;
using System.Collections.Generic;

namespace StudentDashboard.API.Data
{
    public class DashboardContext : DbContext
    {
        public DashboardContext(DbContextOptions<DashboardContext> options) : base(options)
        {
        }

        public DbSet<StudentTask> StudentTasks { get; set; }

        public DbSet<ScheduleItem> ScheduleItems { get; set; }

        public DbSet<User> Users { get; set; }
    }
}