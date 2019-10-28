import Mail from '../../lib/Mail';

class HelpOrderAnswer {
  get key() {
    return 'HelpOrderAnswer';
  }

  async handle({ data }) {
    const { helpOrder } = data;

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Sua pergunta foi respondida',
      template: 'helpOrderAnswer',
      context: {
        student: helpOrder.student.name,
        question: helpOrder.question,
        answer: helpOrder.answer,
      },
    });
  }
}

export default new HelpOrderAnswer();
