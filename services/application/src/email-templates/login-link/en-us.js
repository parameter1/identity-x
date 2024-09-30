const stripTags = require('striptags');
const debug = require('debug')('mailer');

module.exports = ({
  sendingDomain,
  supportEmail,
  url,
  appName,
  addressValues,
  loginLinkTemplate,
  user,
} = {}) => {
  debug(url, 'INCOMING TO TEMPLATE URL');
  const { verified } = user;
  const subject = loginLinkTemplate.subject || 'Your personal login link';
  const unverifiedVerbiage = loginLinkTemplate.unverifiedVerbiage || `You recently requested to log in to <strong>${appName}</strong>. This link is good for one hour.`;
  const verifiedVerbiage = loginLinkTemplate.verifiedVerbiage || `You recently requested to log in to <strong>${appName}</strong>. This link is good for one hour.`;
  const verbiage = verified ? verifiedVerbiage : unverifiedVerbiage;
  return ({
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
        <title>Your personal login link</title>
      </head>
      <body>
        <p>${verbiage}</p>
        <p>
          <a href="${url}">
            <table border="0" cellspacing="0" cellpadding="0" style="background-color: #15c; color: #fff">
              <tr>
                <td style="padding: 8px;>
                  Confirm + Log In
                </td>
              </tr>
            </table>
          </a>
        </p>
        <p>If you didn't request this link, simply ignore this email${supportEmail ? ` or <a href="mailto:${supportEmail}">contact our support staff</a>` : ''}.</p>
        <hr>
        <small style="font-color: #ccc;">
          <p>Please add <em>${sendingDomain}</em> to your address book or safe sender list to ensure you receive future emails from us.</p>
          <p>You are receiving this email because a login request was made on ${appName}.</p>
          <p>For additional information please contact ${appName} c/o ${addressValues.join(', ')}.</p>
        </small>
      </body>
    </html>
    `,
    text: `
${stripTags(verbiage, [])}

Confrim & Log In:
${url}

If you didn't request this link, simply ignore this email or contact our support staff at ${supportEmail}.

-------------------------

Please add ${sendingDomain} to your address book or safe sender list to ensure you receive future emails from us.
You are receiving this email because a login request was made on ${appName}.
For additional information please contact ${appName} c/o ${addressValues.join(', ')}.
    `,
    subject,
  });
};
