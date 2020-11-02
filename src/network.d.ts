declare module 'network' {
  function get_private_ip(cb: (err: string | null, ip: string | undefined) => any);
}