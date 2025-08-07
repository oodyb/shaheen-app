
import "./Contact.css";
const Contact = () => {
  return (
    <section id="contact">
      <img src="./contact.png" alt="contact" />
      <form action="https://formspree.io/f/xqkzvqkb" method="POST">
        <h1>Let’s get in touch</h1>
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="text" name="subject" placeholder="Subject" required />
        <textarea name="message" placeholder="Message" required></textarea>
        <input type="submit" value="Send" />
      </form>
    </section>
  );
};

export default Contact;