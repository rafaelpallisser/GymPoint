import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { enrollmentMail } = data;

    await Mail.sendMail({
      to: `${enrollmentMail.student.name} <${enrollmentMail.student.email}>`,
      subject: 'Seja bem-vindo(a) a GymPoint',
      template: 'enrollment',
      context: {
        student: enrollmentMail.student.name,
        plan: enrollmentMail.plan.title,
        start_date: format(
          parseISO(enrollmentMail.start_date),
          "dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        end_date: format(
          parseISO(enrollmentMail.end_date),
          "dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        price: enrollmentMail.plan.price,
      },
    });
  }
}

export default new EnrollmentMail();
