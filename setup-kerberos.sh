#!/usr/bin/env sh
set -eu

echo "WARNING: overwriting /etc/krb5.conf"
echo "NOTE: old is backed up at /etc/krb5.conf.bak"
if [ -f /etc/krb5.conf ]; then
  mv /etc/krb5.conf /etc/krb5.conf.bak
fi

cat > /etc/krb5.conf <<'EOF'
[libdefaults]
  default_realm = CHALMERS.SE
  clockskew = 300
  v4_instance_resolve = false
  dns_lookup_kdc = true
[realms]
  CHALMERS.SE = {
    kdc = kdc1.ita.chalmers.se:88
    kdc = kdc2.ita.chalmers.se:88
    kdc = kdc3.ita.chalmers.se:88
  }
[domain_realm]
  .chalmers.se = CHALMERS.SE
  chalmers.se = CHALMERS.SE
[logging]
  default = SYSLOG:INFO:USER
EOF
