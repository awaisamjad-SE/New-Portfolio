import emailjs from "@emailjs/browser";

const _status = {
    didInit: false,
    config: null
}

// Default webhook for contact form submissions
// The demo form uses '/webhook-test/contact-form' — try that first as it's known to work.
const DEFAULT_CONTACT_WEBHOOK = 'https://n8n.awaisamjad.me/webhook-test/contact-form'
const ALT_CONTACT_WEBHOOK = 'https://n8n.awaisamjad.me/webhook/contact-form'

export const useEmails = () => {
    /**
     * @param {Object} config
     */
    const init = (config) => {
        emailjs.init(config.publicKey)
        _status.config = config
        _status.didInit = true
    }

    /**
     * @return {boolean}
     */
    const isInitialized = () => {
        // allow sending even if EmailJS wasn't initialized; sending can use the webhook instead
        return true
    }

    /**
     * Send contact information either to configured webhook or fallback to EmailJS.
     * Returns an object: { ok: boolean, error?: string }
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} message
     * @return {Promise<{ok:boolean,error?:string}>}
     */
    const sendContactEmail = async (fromName, fromEmail, message) => {
        // Prepare payload for webhook (name, email, message only)
        const payload = {
            name: fromName,
            email: fromEmail,
            message: message
        }

        // try a prioritized list of webhook endpoints (allow override via config.contactWebhook)
        const webhooksToTry = []
        if(_status.config && _status.config.contactWebhook) webhooksToTry.push(_status.config.contactWebhook)
        webhooksToTry.push(DEFAULT_CONTACT_WEBHOOK)
        webhooksToTry.push(ALT_CONTACT_WEBHOOK)

        let webhookError = null
        for(const webhookUrl of webhooksToTry) {
            try {
                const res = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })

                if(res.ok) {
                    return { ok: true }
                }

                let text = ''
                try { text = await res.text() } catch (e) { /* ignore */ }
                console.error('[sendContactEmail] webhook returned non-OK', webhookUrl, res.status, text)
                webhookError = `Webhook ${webhookUrl} responded ${res.status}` + (text ? `: ${text}` : '')
                // try next webhook
            } catch (err) {
                console.error('[sendContactEmail] webhook fetch error', webhookUrl, err)
                webhookError = (err && err.message) ? `${webhookUrl} error: ${err.message}` : `${webhookUrl} error: ${String(err)}`
                // try next webhook
            }
        }

        // Fallback: if EmailJS is configured, try sending via EmailJS
        if(_status.config && _status.didInit) {
            const params = {
                from_name: fromName,
                from_email: fromEmail,
                message: message
            }

            try {
                await emailjs.send(
                    _status.config['serviceId'],
                    _status.config['templateId'],
                    params
                )
                return { ok: true }
            } catch (error) {
                console.error('[sendContactEmail] EmailJS error', error)
                return { ok: false, error: (error && error.text) ? error.text : (error && error.message) ? error.message : 'EmailJS send failed' }
            }
        }

        return { ok: false, error: webhookError || 'Failed to send via webhook or EmailJS' }
    }

    return {
        init,
        isInitialized,
        sendContactEmail
    }
}