#if !ADMIN_SIG
#define ADMIN_SIG

module type AdminSig = sig

type admin_storage

type admin_entrypoints

val fail_if_not_admin : admin_storage -> unit

val fail_if_not_admin_ext : admin_storage * string -> unit

val is_admin : admin_storage -> bool

val fail_if_paused : admin_storage -> unit

val admin_main : admin_entrypoints * admin_storage -> (operation list) * admin_storage

end

#endif