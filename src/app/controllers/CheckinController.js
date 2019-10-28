import { addDays, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const chekins = await Checkin.findAll({
      where: { student_id: req.params.studentId },
    });

    return res.json(chekins);
  }

  async store(req, res) {
    const endDay = endOfDay(new Date());

    const hourStart = startOfDay(new Date());
    const startDay = addDays(hourStart, -7);

    const checkinsCount = await Checkin.count({
      where: {
        student_id: req.params.studentId,
        created_at: { [Op.between]: [startDay, endDay] },
      },
    });

    console.log(checkinsCount);

    if (checkinsCount >= 5) {
      return res
        .status(401)
        .json({ error: 'Student has checked in 5 times in 7 days' });
    }

    const checkin = await Checkin.create({ student_id: req.params.studentId });

    return res.json(checkin);
  }
}

export default new CheckinController();
