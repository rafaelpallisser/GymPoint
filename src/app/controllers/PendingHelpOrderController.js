import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class PendingHelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
      attributes: ['question', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
      ],
    });

    return res.json(helpOrders);
  }
}

export default new PendingHelpOrderController();
