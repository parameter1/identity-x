const stripTags = require('striptags');

module.exports = ({
  sendingDomain,
  supportEmail,
  url,
  appName,
  addressValues,
  loginLinkTemplate,
  user,
} = {}) => {
  const { verified } = user;
  const subject = loginLinkTemplate.subject || 'O seu link pessoal de acesso';
  const unverifiedVerbiage = loginLinkTemplate.unverifiedVerbiage || `Você solicitou recentemente o login no <strong>${appName}</strong>. Este link é válido por uma hora.`;
  const verifiedVerbiage = loginLinkTemplate.verifiedVerbiage || `Você solicitou recentemente o login no <strong>${appName}</strong>. Este link é válido por uma hora.`;
  const verbiage = verified ? verifiedVerbiage : unverifiedVerbiage;
  const loginLinkStyle = loginLinkTemplate.loginLinkStyle ? loginLinkTemplate.loginLinkStyle : '';
  const loginLinkText = loginLinkTemplate.loginLinkText ? loginLinkTemplate.loginLinkText : `Acesse o ${appName}`;
  return ({
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body>
        <p>${verbiage}</p>
        <p>
          <a href="${url}" style="${loginLinkStyle}">
            <strong>
              ${loginLinkText}
            </strong>
          </a>
        </p>
        <p>Se você não solicitou este link, basta ignorar este e-mail ${supportEmail ? ` ou <a href="mailto:${supportEmail}">entrar em contato com nossa equipe de suporte</a>` : ''}.</p>
        <hr>
        <small style="font-color: #ccc;">
          <p>Adicione <em>${sendingDomain}</em> à sua lista de contatos ou lista de remetentes confiáveis para garantir que você receba futuros e-mails nossos.</p>
          <p>Você está recebendo este e-mail porque foi feita uma solicitação de login no ${appName}.</p>
          <p>Para mais informações, entre em contato com o ${appName} c/o ${addressValues.join(', ')}.</p>
        </small>
      </body>
    </html>
    `,
    text: `
${stripTags(verbiage, [])}

${loginLinkText}:
${url}


Se você não solicitou este link, simplesmente ignore este e-mail ou entre em contato com nossa equipe de suporte em ${supportEmail}.

-------------------------

Adicione ${sendingDomain} à sua lista de endereços ou de remetentes seguros para garantir que você receba nossos e-mails no futuro.
Você está recebendo este e-mail porque uma solicitação de login foi feita no ${appName}.
Para obter mais informações, entre em contato ${appName} c/o ${addressValues.join(', ')}.
    `,
    subject,
  });
};
