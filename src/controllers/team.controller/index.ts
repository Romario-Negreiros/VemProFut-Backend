import teamServices from "../../services/team.services";

import type { Controller, ITeamController, IParams } from "./types";

class TeamController implements ITeamController {
  getOne: Controller = async (req, res) => {
    const { id } = req.params as IParams["getOne"];
    if (id === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'id do time' está vazio." });
    }

    try {
      const team = await teamServices.getOne(id);

      if (team === undefined) {
        return await res.status(404).send({ error: "Time não encontrado." });
      }

      await res.status(200).send({ team });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar buscar o usuário." });
    }
  };
}

export default new TeamController();
