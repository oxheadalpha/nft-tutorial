#if !MINTER_SIG
#define MINTER_SIG

module type MinterSig = sig

  type storage
  type entrypoints
  val fail_if_frozen : storage -> unit

end

#endif
