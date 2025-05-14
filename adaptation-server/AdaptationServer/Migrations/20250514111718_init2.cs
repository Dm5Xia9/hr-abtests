using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdaptationServer.Migrations
{
    /// <inheritdoc />
    public partial class init2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyProfileId",
                table: "Tracks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyProfileId",
                table: "Positions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Notifications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Message",
                table: "Notifications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyProfileId",
                table: "Notifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "Employees",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "AdaptationStatus",
                table: "Employees",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "AccessLink",
                table: "Employees",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyProfileId",
                table: "Employees",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyProfileId",
                table: "Departments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentCompanyId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyProfileId",
                table: "Articles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "CompanyProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    Industry = table.Column<string>(type: "text", nullable: true),
                    Size = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyProfiles_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanyMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyMembers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompanyMembers_CompanyProfiles_CompanyProfileId",
                        column: x => x.CompanyProfileId,
                        principalTable: "CompanyProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tracks_CompanyProfileId",
                table: "Tracks",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_CompanyProfileId",
                table: "Positions",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CompanyProfileId",
                table: "Notifications",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_CompanyProfileId",
                table: "Employees",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CompanyProfileId",
                table: "Departments",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_CurrentCompanyId",
                table: "AspNetUsers",
                column: "CurrentCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_CompanyProfileId",
                table: "Articles",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyMembers_CompanyProfileId",
                table: "CompanyMembers",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyMembers_UserId",
                table: "CompanyMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyProfiles_OwnerId",
                table: "CompanyProfiles",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Articles_CompanyProfiles_CompanyProfileId",
                table: "Articles",
                column: "CompanyProfileId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CompanyProfiles_CurrentCompanyId",
                table: "AspNetUsers",
                column: "CurrentCompanyId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_CompanyProfiles_CompanyProfileId",
                table: "Departments",
                column: "CompanyProfileId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_CompanyProfiles_CompanyProfileId",
                table: "Employees",
                column: "CompanyProfileId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_CompanyProfiles_CompanyProfileId",
                table: "Notifications",
                column: "CompanyProfileId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Positions_CompanyProfiles_CompanyProfileId",
                table: "Positions",
                column: "CompanyProfileId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tracks_CompanyProfiles_CompanyProfileId",
                table: "Tracks",
                column: "CompanyProfileId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Articles_CompanyProfiles_CompanyProfileId",
                table: "Articles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CompanyProfiles_CurrentCompanyId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_CompanyProfiles_CompanyProfileId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_CompanyProfiles_CompanyProfileId",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_CompanyProfiles_CompanyProfileId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Positions_CompanyProfiles_CompanyProfileId",
                table: "Positions");

            migrationBuilder.DropForeignKey(
                name: "FK_Tracks_CompanyProfiles_CompanyProfileId",
                table: "Tracks");

            migrationBuilder.DropTable(
                name: "CompanyMembers");

            migrationBuilder.DropTable(
                name: "CompanyProfiles");

            migrationBuilder.DropIndex(
                name: "IX_Tracks_CompanyProfileId",
                table: "Tracks");

            migrationBuilder.DropIndex(
                name: "IX_Positions_CompanyProfileId",
                table: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_CompanyProfileId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Employees_CompanyProfileId",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Departments_CompanyProfileId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_CurrentCompanyId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_Articles_CompanyProfileId",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "CompanyProfileId",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "CompanyProfileId",
                table: "Positions");

            migrationBuilder.DropColumn(
                name: "CompanyProfileId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "CompanyProfileId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "CompanyProfileId",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "CurrentCompanyId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CompanyProfileId",
                table: "Articles");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Notifications",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Message",
                table: "Notifications",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "Employees",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "AdaptationStatus",
                table: "Employees",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "AccessLink",
                table: "Employees",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "AspNetUsers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }
    }
}
