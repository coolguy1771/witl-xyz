export type BootLineKind = "plain" | "ok" | "job" | "kernel" | "banner" | "warn";
export type BootLineReveal = "instant" | "typewriter" | "prompt";

export interface BootLine {
  kind: BootLineKind;
  text: string;
  delayMs?: number;
  reveal?: BootLineReveal;
  /** Static getty prompt shown before simulated user input (e.g. "witl.xyz login: "). */
  promptPrefix?: string;
  /** Characters the user would type at the prompt (e.g. username). */
  promptInput?: string;
}

export const RHEL_HOSTNAME = "witl.xyz";
export const RHEL_LOGIN_USER = "visitor";
export const RHEL_LOGIN_PROMPT = `${RHEL_HOSTNAME} login: `;
export const CLIENT_IP_PLACEHOLDER = "__CLIENT_IP__";
export const LAST_LOGIN_TIME_PLACEHOLDER = "__LAST_LOGIN_TIME__";

export const SYSTEMD_BOOT_LINES: BootLine[] = [
  // === Kernel Early Messages ===
  {
    kind: "kernel",
    text: "[    0.000000] Linux version 5.14.0-427.28.1.el9_4.x86_64 (mockbuild@x86-01) (gcc (GCC) 11.4.1 20231218) #1 SMP PREEMPT_DYNAMIC",
    delayMs: 0,
  },
  {
    kind: "kernel",
    text: "[    0.000000] Command line: BOOT_IMAGE=(hd0,gpt2)/vmlinuz-5.14.0-427.28.1.el9_4.x86_64 root=/dev/mapper/rhel-root ro crashkernel=auto audit=1 selinux=1 enforcing=1 fips=1 panic=5 console=ttyS0,115200n8 nousb",
    delayMs: 90,
  },
  {
    kind: "kernel",
    text: "[    0.142891] SELinux:  Initializing.",
    delayMs: 70,
  },
  {
    kind: "kernel",
    text: "[    0.143112] SELinux: policy capability network_peer_controls=1 open_perms=1 extended_socket_class=1 always_check_network=0 cgroup_seclabel=1",
    delayMs: 40,
  },
  {
    kind: "kernel",
    text: "[    0.157204] SELinux: 2048 avtab hash slots, 103132 rules.",
    delayMs: 40,
  },
  {
    kind: "kernel",
    text: "[    0.201443] SELinux: 2 users, 14 roles, 5106 types, 316 bools, 1 sens, 1024 cats",
    delayMs: 40,
  },
  {
    kind: "kernel",
    text: "[    0.201888] SELinux: 130 classes, 103132 rules",
    delayMs: 30,
  },
  {
    kind: "kernel",
    text: "[    0.208741] device-mapper: ioctl: 4.47.0-ioctl (2022-07-28) initialised: dm-devel@redhat.com",
    delayMs: 50,
  },
  {
    kind: "kernel",
    text: "[    0.209103] cryptd: max_cpu_qlen set to 1000",
    delayMs: 30,
  },
  {
    kind: "kernel",
    text: "[    0.210882] ima: Allocated hash algorithm: sha256",
    delayMs: 40,
  },
  {
    kind: "kernel",
    text: "[    0.211340] integrity: Platform Keyring initialized",
    delayMs: 40,
  },
  {
    kind: "kernel",
    text: "[    0.212019] alg: self-tests for sha256 (sha256-avx2) passed",
    delayMs: 40,
  },
  {
    kind: "kernel",
    text: "[    0.318204] systemd[1]: systemd 252-46.el9 running in system mode (+PAM +AUDIT +SELINUX -APPARMOR +IMA +SMACK)",
    delayMs: 100,
  },
  {
    kind: "banner",
    text: "Red Hat Enterprise Linux release 9.4 (Plow)",
    delayMs: 120,
  },
  { kind: "plain", text: `systemd[1]: Hostname set to ${RHEL_HOSTNAME}.`, delayMs: 90 },
  { kind: "plain", text: "", delayMs: 30 },

  // === Core System Services ===
  { kind: "ok", text: "Started systemd-journald.service - Journal Service.", delayMs: 55 },
  { kind: "ok", text: "Started systemd-tmpfiles-setup-dev.service - Create Static Device Nodes in /dev.", delayMs: 45 },
  { kind: "ok", text: "Started systemd-udevd.service - Rule-based Manager for Device Events and Files.", delayMs: 50 },
  { kind: "ok", text: "Started dm-event.service - Device-mapper event daemon.", delayMs: 45 },
  { kind: "ok", text: "Started lvm2-monitor.service - Monitoring of LVM2 mirrors, snapshots etc.", delayMs: 50 },
  { kind: "ok", text: "Started systemd-remount-fs.service - Remount Root and Kernel File Systems.", delayMs: 50 },
  { kind: "ok", text: "Started systemd-sysctl.service - Apply Kernel Variables.", delayMs: 45 },
  { kind: "ok", text: "Started systemd-modules-load.service - Load Kernel Modules.", delayMs: 50 },
  { kind: "ok", text: "Started rngd.service - Hardware RNG Entropy Gatherer Daemon.", delayMs: 50 },
  { kind: "ok", text: "Started systemd-random-seed.service - Load/Save OS Random Seed.", delayMs: 45 },
  { kind: "ok", text: "Started systemd-tmpfiles-setup.service - Create Volatile Files and Directories.", delayMs: 50 },
  { kind: "ok", text: "Started kmod-static-nodes.service - Create List of Static Device Nodes.", delayMs: 45 },
  { kind: "ok", text: "Reached target local-fs-pre.target - Preparation for Local File Systems.", delayMs: 40 },
  { kind: "ok", text: "Mounted dev-hugepages.mount - Huge Pages File System.", delayMs: 45 },
  { kind: "ok", text: "Mounted sys-kernel-tracing.mount - Kernel Trace File System.", delayMs: 45 },
  { kind: "ok", text: "Mounted sys-fs-fuse-connections.mount - FUSE Control File System.", delayMs: 45 },
  { kind: "ok", text: "Reached target local-fs.target - Local File Systems.", delayMs: 50 },
  { kind: "ok", text: "Started systemd-update-utmp.service - Record System Boot/Shutdown in UTMP.", delayMs: 45 },
  { kind: "ok", text: "Reached target sysinit.target - System Initialization.", delayMs: 55 },

  // === Network ===
  { kind: "job", text: "A start job is running for NetworkManager-wait-online.service (40s / 2min)", delayMs: 380 },
  { kind: "ok", text: "Started NetworkManager.service - Network Manager.", delayMs: 60 },
  { kind: "ok", text: "Started NetworkManager-dispatcher.service - Network Manager Script Dispatcher.", delayMs: 45 },
  { kind: "ok", text: "Started chronyd.service - NTP client/server.", delayMs: 55 },
  { kind: "ok", text: "Reached target network.target - Network.", delayMs: 50 },
  { kind: "ok", text: "Reached target network-online.target - Network is Online.", delayMs: 55 },

  // === Security & Hardening Services ===
  { kind: "ok", text: "Started dbus-broker.service - D-Bus System Message Bus.", delayMs: 50 },
  { kind: "ok", text: "Started systemd-logind.service - User Login Management.", delayMs: 50 },
  { kind: "ok", text: "Started polkit.service - Authorization Manager.", delayMs: 45 },
  { kind: "ok", text: "Started crypto-policies-update.service - Update System-Wide Cryptographic Policies.", delayMs: 55 },
  { kind: "ok", text: "Started audit-rules.service - Load Audit Rules.", delayMs: 50 },
  { kind: "ok", text: "Started auditd.service - Security Auditing Service.", delayMs: 55 },
  { kind: "ok", text: "Started fapolicyd.service - File Access Policy Daemon.", delayMs: 65 },
  { kind: "ok", text: "Started usbguard.service - USBGuard daemon.", delayMs: 50 },
  { kind: "ok", text: "Started sssd.service - System Security Services Daemon.", delayMs: 60 },
  { kind: "ok", text: "Started sssd-kcm.service - SSSD Kerberos Cache Manager.", delayMs: 45 },
  { kind: "ok", text: "Started firewalld.service - firewalld - dynamic firewall daemon.", delayMs: 55 },
  { kind: "ok", text: "Started pcscd.service - PC/SC Smart Card Daemon.", delayMs: 45 },
  { kind: "ok", text: "Started aidecheck.service - AIDE File Integrity Check.", delayMs: 75 },
  { kind: "ok", text: "Started aidecheck.timer - AIDE integrity check scheduled timer.", delayMs: 40 },
  { kind: "ok", text: "Started crond.service - Command Scheduler.", delayMs: 45 },
  { kind: "ok", text: "Started dnf-automatic.timer - dnf-automatic (security) timer.", delayMs: 40 },
  { kind: "ok", text: "Started sshd.service - OpenSSH server daemon.", delayMs: 50 },
  { kind: "ok", text: "Started rsyslog.service - System Logging Service.", delayMs: 45 },
  { kind: "ok", text: "Started tuned.service - Dynamic System Tuning Daemon.", delayMs: 50 },
  { kind: "ok", text: "Started rhsmcertd.service - Enable periodic update of entitlement certificates.", delayMs: 50 },
  { kind: "ok", text: "Started irqbalance.service - irqbalance daemon.", delayMs: 45 },
  { kind: "ok", text: "Reached target basic.target - Basic System.", delayMs: 40 },

  // === Application Services ===
  { kind: "plain", text: "", delayMs: 30 },
  { kind: "ok", text: "Started nginx.service - The nginx HTTP and reverse proxy server.", delayMs: 50 },
  { kind: "ok", text: "Started witl-blog.service - Markdown Content Pipeline.", delayMs: 45 },
  { kind: "ok", text: "Started podman.service - Podman API Service.", delayMs: 50 },
  { kind: "ok", text: "Started opennext-worker.service - Edge SSR Runtime.", delayMs: 45 },
  { kind: "ok", text: "Reached target multi-user.target - Multi-User System.", delayMs: 60 },
  { kind: "ok", text: "Started getty@ttyS0.service - Getty on ttyS0.", delayMs: 50 },

  // === OS Login Banner ===
  { kind: "plain", text: "", delayMs: 40 },
  {
    kind: "banner",
    text: "Red Hat Enterprise Linux 9.4 (Plow)",
    delayMs: 180,
  },
  {
    kind: "plain",
    text: "Kernel 5.14.0-427.28.1.el9_4.x86_64 on an x86_64",
    delayMs: 120,
  },
  { kind: "plain", text: "", delayMs: 60 },

  // === CIS Benchmark Default Banner (/etc/issue) ===
  // CIS RHEL 9 Benchmark v2.0.0 section 1.7 — organization-defined authorized-use notice
  {
    kind: "warn",
    text: "Authorized users only. All activity may be monitored and reported.",
    delayMs: 60,
  },

  { kind: "plain", text: "", delayMs: 40 },
  {
    kind: "plain",
    text: `${RHEL_LOGIN_PROMPT}${RHEL_LOGIN_USER}`,
    promptPrefix: RHEL_LOGIN_PROMPT,
    promptInput: RHEL_LOGIN_USER,
    delayMs: 450,
    reveal: "typewriter",
  },
  {
    kind: "plain",
    text: "Password: ",
    promptPrefix: "Password: ",
    delayMs: 700,
    reveal: "prompt",
  },
  { kind: "ok", text: `Started session-1.scope - Session 1 of User ${RHEL_LOGIN_USER}.`, delayMs: 320 },
  { kind: "ok", text: `Started user@1001.service - User Manager for UID 1001.`, delayMs: 280 },
  {
    kind: "plain",
    text: `Last login: ${LAST_LOGIN_TIME_PLACEHOLDER} from ${CLIENT_IP_PLACEHOLDER} on ttyS0`,
    delayMs: 400,
  },
];

export const BOOT_STORAGE_KEY = "witl-systemd-boot-complete";
