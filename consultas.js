const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "root",
  database: "joyas",
  port: 5432,
  allowExitOnIdle: true,
});

const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC", page = 1 }) => {
  try {
    const [campo, direccion] = order_by.split("_");
    const offset = (page - 1) * limits;
    const consultaFormateada = format(
      "SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s",
      campo,
      direccion,
      limits,
      offset
    );
    const { rows: joyas } = await pool.query(consultaFormateada);
    return joyas;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  try {
    let filtros = [];
    let values = [];

    const agregarFiltro = (campo, comparador, valor) => {
      values.push(valor);
      const { length } = filtros;
      filtros.push(`${campo} ${comparador} $${length + 1}`);
    };

    if (precio_max) agregarFiltro("precio", "<=", precio_max);
    if (precio_min) agregarFiltro("precio", ">=", precio_min);
    if (categoria) agregarFiltro("categoria", "=", categoria);
    if (metal) agregarFiltro("Metal", "=", metal);

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
      filtros = filtros.join(" AND ");
      consulta += ` WHERE ${filtros}`;
    }
    const { rows: joyas } = await pool.query(consulta, values);
    return joyas;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const prepararHATEOASjoyas = (joyas) => {
  try {
    const results = joyas
      .map((j) => {
        return {
          name: j.nombre,
          href: `/joyas/joya/${j.id}`,
        };
      })
      .slice(0, 4);
    const total = joyas.length;
    const HATEOAS = {
      total,
      results,
    };
    return HATEOAS;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  obtenerJoyas,
  obtenerJoyasPorFiltros,
  prepararHATEOASjoyas,
};
