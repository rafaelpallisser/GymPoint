import * as Yup from 'yup';
import { parseISO, startOfHour, addMonths } from 'date-fns';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Enrollment from '../models/Enrollment';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // Check if Student exists
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    // Check if Plan exists
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const hourStart = startOfHour(parseISO(start_date));

    const end_date = addMonths(parseISO(start_date), plan.duration);

    const priceFinal = plan.duration * plan.price;

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: hourStart,
      end_date,
      price: priceFinal,
    });

    const enrollmentMail = await Enrollment.findOne({
      where: { id: enrollment.id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'price'],
        },
      ],
    });

    await Queue.add(EnrollmentMail.key, {
      enrollmentMail,
    });

    return res.json(enrollmentMail);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { student_id, plan_id, start_date } = req.body;

    const enrollment = await Enrollment.findByPk(id);

    const plan = await Plan.findByPk(plan_id);

    const hourStart = startOfHour(parseISO(start_date));
    const end_date = addMonths(parseISO(start_date), plan.duration);
    const priceFinal = plan.duration * plan.price;

    await enrollment.update({
      student_id,
      plan_id,
      start_date: hourStart,
      end_date,
      price: priceFinal,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    await enrollment.destroy();

    return res.json({
      message: 'Enrollment has been removed',
    });
  }
}

export default new EnrollmentController();
