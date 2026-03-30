using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentDashboard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPriorityAndCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "StudentTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "StudentTasks",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "StudentTasks");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "StudentTasks");
        }
    }
}
