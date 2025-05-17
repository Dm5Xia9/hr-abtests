using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdaptationServer.Migrations
{
    /// <inheritdoc />
    public partial class init4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Dictionary<string, string>>(
                name: "Steps",
                table: "EmployeeTracks",
                type: "jsonb",
                nullable: false);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentTrackId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Steps",
                table: "EmployeeTracks");

            migrationBuilder.DropColumn(
                name: "CurrentTrackId",
                table: "AspNetUsers");
        }
    }
}
