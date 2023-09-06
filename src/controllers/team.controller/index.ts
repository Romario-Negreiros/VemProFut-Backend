import teamServices from "../../services/team.services";
import venuesServices from "../../services/venues.services";

import type { Controller, ITeamController, RequestParams } from "./types";

class TeamController implements ITeamController {
  get: Controller = async (req, res) => {
    const { id } = req.params as RequestParams;
    if (!id) {
      return await res.status(400).send({ error: "Parâmetro 'id do time' está vazio." });
    }

    try {
      const team = await teamServices.get(id);

      if (!team) {
        return await res.status(404).send({ error: "Time não encontrado." });
      }

      let venue;
      if (team.venueId) {
        venue = await venuesServices.get(team.venueId);
      }

      delete team.venueId;
      await res.status(200).send({ team: { ...team, venue } });
    } catch (error) {
      console.log(error);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar buscar o usuário." });
    }
  };
}

export default new TeamController();
