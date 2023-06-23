#if !MINTER_SIG
#define MINTER_SIG

module type MinterSig = sig

  type storage
  type entrypoints
  type token_storage
  val fail_if_frozen : storage -> unit
  val main : entrypoints * token_storage * storage -> token_storage * storage

end

#endif
