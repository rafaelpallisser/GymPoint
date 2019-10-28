import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  /**
   * List all Plans
   */
  async index(req, res) {
    const { page = 1 } = req.query;

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(plans);
  }

  /**
   * Insert new Plans
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const planExists = await Plan.findOne({ where: { title } });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    const { duration, price } = await Plan.create(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  /**
   * Update Plan by Id
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { title } = req.body;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    if (title !== undefined && title !== plan.title) {
      const planExists = await Plan.findOne({ where: { title } });

      if (planExists) {
        return res.status(400).json({ error: 'Plan already exists' });
      }
    }

    const { duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  /**
   * Delete Plan by Id
   */
  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    await plan.destroy();

    return res.json({
      message: `Plan ${plan.title} has been removed`,
    });
  }
}

export default new PlanController();
