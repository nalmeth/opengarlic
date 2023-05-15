# What are these files?

- certbot.sh - Runs certbot
- localcert.conf - Config file for generating development localhost certificates
- chain.pem - The trusted intermediate certificate from LetsEncrypt
- ssl-dhparams.pem - Diffie-Hellman parameters

---

# Should they be in source control?

Yes. It's fine. None of these are secret.
They can be found publicly posted as shown below:

- chain.pem - https://letsencrypt.org/certificates/
- ssl-dhparams.pem - https://github.com/certbot/certbot/blob/master/certbot/certbot/ssl-dhparams.pem