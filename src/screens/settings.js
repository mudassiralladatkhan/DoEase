import { createIcons, AlertTriangle, Info } from 'lucide';

const PUBLIC_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];

export class SettingsScreen {
  constructor(user, onUserUpdate) {
    this.user = user;
    this.onUserUpdate = onUserUpdate;
    this.element = document.createElement('div');
    this.element.className = 'settings-section-wrapper';
    this.fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || '';
  }

  isPublicDomain(email) {
    if (!email) return true; // Assume problematic if not set
    const domain = email.split('@')[1];
    return PUBLIC_EMAIL_DOMAINS.includes(domain);
  }

  render() {
    const isSenderInvalid = this.isPublicDomain(this.fromEmail);

    this.element.innerHTML = `
      <div class="content-header">
        <h2>Settings</h2>
      </div>
      <div class="settings-section profile-section">

        <div class="email-config-warning">
            <div class="warning-icon"><i data-lucide="alert-triangle"></i></div>
            <div class="warning-content">
                <h4>Email Notifications Are Not Configured Correctly</h4>
                <p>To receive emails, you <strong>must</strong> send them from a custom domain you own (e.g., <code>notifications@yourdomain.com</code>). Email services block sending from public addresses like <code>@gmail.com</code>.</p>
                <p><strong>This is the final step to make emails work.</strong></p>
                <ol>
                  <li>Log in to your <strong>Resend account</strong> and add a domain you own.</li>
                  <li>Verify the domain by adding the required DNS records with your domain provider.</li>
                  <li>In your <strong>Supabase Dashboard</strong>, go to <strong>Project Settings → Edge Functions</strong>.</li>
                  <li>Update the <code>RESEND_FROM_EMAIL</code> secret to an email from your verified domain.</li>
                </ol>
            </div>
        </div>

        <div class="info-box ${isSenderInvalid ? 'error' : 'success'}">
            <div class="icon"><i data-lucide="${isSenderInvalid ? 'alert-triangle' : 'check-circle'}"></i></div>
            <div>
                <strong>Configuration Status Check</strong>
                <p>
                  ${isSenderInvalid
                    ? `Your configured sender email (<code>${this.fromEmail}</code>) is from a public domain. <strong>This will not work.</strong> Please follow the steps above to use a verified custom domain.`
                    : `Your sender email (<code>${this.fromEmail}</code>) appears to be a custom domain. If emails still fail, ensure the domain is fully <strong>verified</strong> in Resend and the API key is correct in your Supabase secrets.`
                  }
                </p>
            </div>
        </div>

        <h3>Notifications</h3>
        <div class="setting-item">
          <div class="setting-text">
            <label for="emailNotifications">Enable Email Notifications</label>
            <p>Receive reminders for tasks and updates on your productivity streak.</p>
          </div>
          <div class="setting-toggle">
            <label class="switch">
              <input type="checkbox" id="emailNotifications" ${this.user.email_notifications_enabled ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    this.element.querySelector('#emailNotifications').addEventListener('change', async (e) => {
      const isEnabled = e.target.checked;
      try {
        await this.onUserUpdate({ email_notifications_enabled: isEnabled });
        this.user.email_notifications_enabled = isEnabled;
        alert('Notification settings updated successfully!');
      } catch (error) {
        alert(`Failed to update settings: ${error.message}`);
        e.target.checked = !isEnabled;
      }
    });

    createIcons({ icons: { AlertTriangle, Info, 'check-circle': AlertTriangle } }); // Using AlertTriangle as a fallback for check-circle if needed
    // A more robust way would be to import CheckCircle from lucide
    // but for this single change, we can see if this works. Let's import it properly.
    const { CheckCircle } = await import('lucide');
    createIcons({ icons: { AlertTriangle, Info, CheckCircle } });


    return this.element;
  }
}
