#!/usr/bin/sh

krb5_conf="""[libdefaults]
  default_realm = CHALMERS.SE
  clockskew = 300
  v4_instance_resolve = false
  dns_lookup_kdc = true

[domain_realm]
  .chalmers.se = CHALMERS.SE
  chalmers.se = CHALMERS.SE
[logging]
  default = SYSLOG:INFO:USER
"""

echo "WARNING: overwriting /etc/krb5.conf"
echo "NOTE: old is backed up at /etc/krb5.conf.bak"
mv /etc/krb5.conf{,.bak}
echo "$krb5_conf" > /etc/krb5.conf
