import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import HelpOrderAnswer from '../jobs/HelpOrderAnswer';
import Queue from '../../lib/Queue';

class HelpOrderController {
  async index(req, res) {
    const { studentId } = req.params;

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: studentId },
      attributes: ['question', 'created_at', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { studentId } = req.params;
    const { question } = req.body;

    const helpOrder = await HelpOrder.create({
      student_id: studentId,
      question,
    });

    return res.json(helpOrder);
  }

  async update(req, res) {
    const { id } = req.params;
    const { answer } = req.body;
    const answer_at = new Date();

    const helpOrder = await HelpOrder.findOne({
      where: { id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    const { question } = await helpOrder.update({
      answer,
      answer_at,
    });

    await Queue.add(HelpOrderAnswer.key, {
      helpOrder,
    });

    return res.json({
      question,
      answer,
      answer_at,
    });
  }
}

export default new HelpOrderController();
