import React from 'react';
import { Row, Col } from 'react-bootstrap';
import FaIcon from '/src/components/generic/FaIcon.jsx';
import { useLanguage } from '/src/providers/LanguageProvider.jsx';

function Form({ children, id, submitLabel, submitIcon, onSubmit }) {
    const { getString } = useLanguage();

    submitIcon = submitIcon || 'fa-solid fa-circle';
    submitLabel = submitLabel || getString('submit');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:3001/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Email sent successfully!');
            } else {
                alert('Failed to send email.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the email.');
        }
    };

    return (
        <form id={id} onSubmit={handleSubmit} className={`mt-4 pt-0 pt-xl-2`}>
            <Row>
                {children}

                <Col className={`col-12 text-center mt-2`}>
                    <button className={`btn btn-xl btn-highlight`} type={`submit`}>
                        <FaIcon iconName={`${submitIcon} me-2`} />
                        {submitLabel}
                    </button>
                </Col>
            </Row>
        </form>
    );
}

export default Form;