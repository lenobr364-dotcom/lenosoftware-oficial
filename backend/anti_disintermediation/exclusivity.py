EXPECTED_LENO_CNPJ = "36.962.878/0001-55"


def normalize_cnpj_digits(value: str | None) -> str:
    return re_sub_digits(value or "")


def re_sub_digits(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())


def is_expected_leno_cnpj(value: str | None) -> bool:
    return normalize_cnpj_digits(value) == normalize_cnpj_digits(EXPECTED_LENO_CNPJ)
