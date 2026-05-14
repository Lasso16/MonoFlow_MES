using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MonoFlow.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "operarios",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    numero_operario = table.Column<int>(type: "integer", nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    rol = table.Column<string>(type: "text", nullable: false, defaultValue: "Operario")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_operarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ordenes",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_navision = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    cliente = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    codigo_procedencia = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ordenes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "outbox_message",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    occurred_on_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    processed_on_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbox_message", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tipos_evento",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tipos_evento", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tipos_incidencia",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tipos_incidencia", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tipos_operacion",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tipos_operacion", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tipos_rechazo",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    motivo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tipos_rechazo", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "articulos",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_orden = table.Column<Guid>(type: "uuid", nullable: false),
                    referencia = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    linea = table.Column<int>(type: "integer", nullable: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false),
                    descripcion = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    inicio_plan = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    fin_plan = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_articulos", x => x.id);
                    table.ForeignKey(
                        name: "fk_articulos_ordenes_id_orden",
                        column: x => x.id_orden,
                        principalSchema: "public",
                        principalTable: "ordenes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "operaciones",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_articulo = table.Column<Guid>(type: "uuid", nullable: false),
                    id_tipo_operacion = table.Column<int>(type: "integer", nullable: false),
                    cantidad_componentes = table.Column<int>(type: "integer", nullable: true),
                    cantidad_total = table.Column<int>(type: "integer", nullable: false),
                    tiempo_plan = table.Column<double>(type: "double precision", nullable: true),
                    tiempo_total = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    ultima_operacion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    fin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_operaciones", x => x.id);
                    table.ForeignKey(
                        name: "FK_operacion_articulo",
                        column: x => x.id_articulo,
                        principalSchema: "public",
                        principalTable: "articulos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_operacion_tipo",
                        column: x => x.id_tipo_operacion,
                        principalSchema: "public",
                        principalTable: "tipos_operacion",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "registros_trabajo",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_operacion = table.Column<Guid>(type: "uuid", nullable: false),
                    inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    finalizado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    observaciones = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    total_producido_ok = table.Column<int>(type: "integer", nullable: false),
                    total_rechazado = table.Column<int>(type: "integer", nullable: false),
                    operacion_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_registros_trabajo", x => x.id);
                    table.ForeignKey(
                        name: "fk_registros_trabajo_operaciones_id_operacion",
                        column: x => x.id_operacion,
                        principalSchema: "public",
                        principalTable: "operaciones",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_registros_trabajo_operaciones_operacion_id",
                        column: x => x.operacion_id,
                        principalSchema: "public",
                        principalTable: "operaciones",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "eventos",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_registro = table.Column<Guid>(type: "uuid", nullable: false),
                    id_tipo_evento = table.Column<int>(type: "integer", nullable: false),
                    inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_eventos", x => x.id);
                    table.ForeignKey(
                        name: "fk_eventos_registros_trabajo_id_registro",
                        column: x => x.id_registro,
                        principalSchema: "public",
                        principalTable: "registros_trabajo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_eventos_tipos_evento_id_tipo_evento",
                        column: x => x.id_tipo_evento,
                        principalSchema: "public",
                        principalTable: "tipos_evento",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "producciones",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_registro = table.Column<Guid>(type: "uuid", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    cantidad_ok = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_producciones", x => x.id);
                    table.ForeignKey(
                        name: "fk_producciones_registros_trabajo_id_registro",
                        column: x => x.id_registro,
                        principalSchema: "public",
                        principalTable: "registros_trabajo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rechazos",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_registro = table.Column<Guid>(type: "uuid", nullable: false),
                    id_tipo_rechazo = table.Column<int>(type: "integer", nullable: false),
                    cantidad_rechazo = table.Column<int>(type: "integer", nullable: false),
                    comentario = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rechazos", x => x.id);
                    table.ForeignKey(
                        name: "FK_rechazadas_tipo",
                        column: x => x.id_tipo_rechazo,
                        principalSchema: "public",
                        principalTable: "tipos_rechazo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_rechazos_registros_trabajo_id_registro",
                        column: x => x.id_registro,
                        principalSchema: "public",
                        principalTable: "registros_trabajo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sesiones_operarios",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_registro = table.Column<Guid>(type: "uuid", nullable: false),
                    id_operario = table.Column<Guid>(type: "uuid", nullable: false),
                    inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sesiones_operarios", x => x.id);
                    table.ForeignKey(
                        name: "FK_sesion_operario",
                        column: x => x.id_operario,
                        principalSchema: "public",
                        principalTable: "operarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_sesiones_operarios_registros_trabajo_id_registro",
                        column: x => x.id_registro,
                        principalSchema: "public",
                        principalTable: "registros_trabajo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "incidencias",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_evento = table.Column<Guid>(type: "uuid", nullable: false),
                    id_tipo_incidencia = table.Column<int>(type: "integer", nullable: false),
                    comentario = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_incidencias", x => x.id);
                    table.ForeignKey(
                        name: "fk_incidencias_eventos_id_evento",
                        column: x => x.id_evento,
                        principalSchema: "public",
                        principalTable: "eventos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_incidencias_tipos_incidencia_id_tipo_incidencia",
                        column: x => x.id_tipo_incidencia,
                        principalSchema: "public",
                        principalTable: "tipos_incidencia",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "UK_articulo_orden_ref_linea",
                schema: "public",
                table: "articulos",
                columns: new[] { "id_orden", "referencia", "linea" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_eventos_id_registro",
                schema: "public",
                table: "eventos",
                column: "id_registro");

            migrationBuilder.CreateIndex(
                name: "ix_eventos_id_tipo_evento",
                schema: "public",
                table: "eventos",
                column: "id_tipo_evento");

            migrationBuilder.CreateIndex(
                name: "ix_incidencias_id_evento",
                schema: "public",
                table: "incidencias",
                column: "id_evento");

            migrationBuilder.CreateIndex(
                name: "ix_incidencias_id_tipo_incidencia",
                schema: "public",
                table: "incidencias",
                column: "id_tipo_incidencia");

            migrationBuilder.CreateIndex(
                name: "ix_operaciones_id_articulo",
                schema: "public",
                table: "operaciones",
                column: "id_articulo");

            migrationBuilder.CreateIndex(
                name: "ix_operaciones_id_tipo_operacion",
                schema: "public",
                table: "operaciones",
                column: "id_tipo_operacion");

            migrationBuilder.CreateIndex(
                name: "UK_operario_numero",
                schema: "public",
                table: "operarios",
                column: "numero_operario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UK_orden_navision",
                schema: "public",
                table: "ordenes",
                column: "id_navision",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_producciones_id_registro",
                schema: "public",
                table: "producciones",
                column: "id_registro");

            migrationBuilder.CreateIndex(
                name: "ix_rechazos_id_registro",
                schema: "public",
                table: "rechazos",
                column: "id_registro");

            migrationBuilder.CreateIndex(
                name: "ix_rechazos_id_tipo_rechazo",
                schema: "public",
                table: "rechazos",
                column: "id_tipo_rechazo");

            migrationBuilder.CreateIndex(
                name: "ix_registros_trabajo_id_operacion",
                schema: "public",
                table: "registros_trabajo",
                column: "id_operacion");

            migrationBuilder.CreateIndex(
                name: "ix_registros_trabajo_operacion_id",
                schema: "public",
                table: "registros_trabajo",
                column: "operacion_id");

            migrationBuilder.CreateIndex(
                name: "ix_sesiones_operarios_id_operario",
                schema: "public",
                table: "sesiones_operarios",
                column: "id_operario");

            migrationBuilder.CreateIndex(
                name: "ix_sesiones_operarios_id_registro",
                schema: "public",
                table: "sesiones_operarios",
                column: "id_registro");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "incidencias",
                schema: "public");

            migrationBuilder.DropTable(
                name: "outbox_message",
                schema: "public");

            migrationBuilder.DropTable(
                name: "producciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "rechazos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "sesiones_operarios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "eventos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "tipos_incidencia",
                schema: "public");

            migrationBuilder.DropTable(
                name: "tipos_rechazo",
                schema: "public");

            migrationBuilder.DropTable(
                name: "operarios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "registros_trabajo",
                schema: "public");

            migrationBuilder.DropTable(
                name: "tipos_evento",
                schema: "public");

            migrationBuilder.DropTable(
                name: "operaciones",
                schema: "public");

            migrationBuilder.DropTable(
                name: "articulos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "tipos_operacion",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ordenes",
                schema: "public");
        }
    }
}
