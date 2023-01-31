const express = require("express");
const app = express();
const { reportarConsulta } = require("./middlewares");

app.listen(3000, console.log("Server ON"));

const {
  obtenerJoyas,
  obtenerJoyasPorFiltros,
  prepararHATEOASjoyas,
} = require("./consultas");

app.get("/joyas", reportarConsulta, async (req, res) => {
  const consulta = req.query;
  const joyas = await obtenerJoyas(consulta);
  const HATEOAS = await prepararHATEOASjoyas(joyas);
  res.json(HATEOAS);
});

app.get("/joyas/filtros", reportarConsulta, async (req, res) => {
  const consulta = req.query;
  const joyas = await obtenerJoyasPorFiltros(consulta);
  res.json(joyas);
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});
