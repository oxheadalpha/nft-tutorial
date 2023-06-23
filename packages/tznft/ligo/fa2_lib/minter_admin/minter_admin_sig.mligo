#if !MINTER_ADMIN_SIG
#define MINTER_ADMIN_SIG

module type MinterAdminSig = sig

  type storage

  type entrypoints

  val is_minter : storage -> bool

  val main : entrypoints * storage -> (operation list) * storage

end

#endif
