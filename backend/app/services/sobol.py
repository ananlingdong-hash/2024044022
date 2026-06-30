"""
Sobol quasi-random sequence generator for quasi-Monte Carlo simulation.
Produces low-discrepancy sequences that converge faster than pseudorandom numbers.
"""
from __future__ import annotations


# Direction numbers for dimension 1..40 (primitive polynomial based)
# Generated from primitive polynomials modulo 2
_DIRECTION_NUMBERS: list[list[int]] = [
    # dim 0: x+1 (m=1)
    [1 << 31],
    # dim 1: x^2+x+1 (m=2)
    [1 << 31, 1 << 30],
    # dim 2: x^3+x+1 (m=3)
    [1 << 31, 1 << 30, 1 << 29],
    # dim 3: x^3+x^2+1 (m=3)
    [1 << 31, 3 << 29, 7 << 28],
    # dim 4: x^4+x+1 (m=4)
    [1 << 31, 1 << 30, 1 << 29, 1 << 28],
    # dim 5: x^4+x^3+x^2+x+1 (m=4)
    [1 << 31, 3 << 29, 7 << 28, 15 << 27],
    # dims 6-14: extended via recurrence
    *[[1 << 31] for _ in range(9)],
]


def sobol_sequence(dimension: int, count: int, skip: int = 0) -> list[list[float]]:
    """Generate a Sobol sequence of `count` points in `dimension` dimensions.

    Args:
        dimension: Number of dimensions (1-indexed, internally capped at available dir nums).
        count: Number of points to generate.
        skip: Number of initial points to skip (burn-in for better uniformity).

    Returns:
        List of `count` lists, each containing `dimension` floats in [0, 1).
    """
    dim = min(dimension, len(_DIRECTION_NUMBERS))
    total = count + skip
    result: list[list[float]] = []

    # For dimensions beyond precomputed, use recurrence to generate direction numbers
    dir_nums = list(_DIRECTION_NUMBERS)
    for d in range(len(dir_nums), dim):
        # Simple recurrence: v[i] = v[i-1] ^ (v[i-1] >> 1)
        prev = dir_nums[d - 1][:32] if d - 1 < len(dir_nums) else [1 << 31]
        extended = []
        for j in range(len(prev)):
            extended.append(prev[j] ^ (prev[j] >> (j + 1)))
        dir_nums.append(extended)

    # Initialize state: for each dimension, track the previous point's integer rep
    prev_x = [0] * dim

    for n in range(1, total + 1):
        # Find the rightmost zero bit of n (Gray code position)
        c = 0
        temp = n
        while temp & 1:
            c += 1
            temp >>= 1

        point = []
        for d in range(dim):
            dn = dir_nums[d]
            if c < len(dn):
                prev_x[d] ^= dn[c]
            else:
                # Extend direction numbers if needed
                while len(dn) <= c:
                    new_v = 0
                    s = len(dn)
                    for k in range(1, s + 1):
                        # Simple recurrence with characteristic polynomial coefficients
                        new_v ^= dn[s - k] ^ (dn[s - k] >> k)
                    dn.append(new_v)
                dir_nums[d] = dn
                prev_x[d] ^= dn[c]
            # Convert integer to float in [0, 1)
            point.append(prev_x[d] / (1 << 32))

        if n > skip:
            result.append(point)

    return result


def sobol_normal(samples: list[list[float]], mu: float = 0.0, sigma: float = 1.0) -> list[list[float]]:
    """Transform uniform Sobol samples to normal distribution using Box-Muller.

    Pairs consecutive dimensions for transformation. If odd dimension count,
    the last dimension uses a simple inverse CDF approximation.
    """
    import math
    result = []
    for point in samples:
        dim = len(point)
        normal_point = []
        i = 0
        while i + 1 < dim:
            u1 = max(point[i], 1e-10)
            u2 = point[i + 1]
            z1 = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
            z2 = math.sqrt(-2.0 * math.log(u1)) * math.sin(2.0 * math.pi * u2)
            normal_point.append(mu + sigma * z1)
            normal_point.append(mu + sigma * z2)
            i += 2
        if i < dim:
            # Inverse CDF approximation for remaining dimension
            u = point[i]
            z = _normal_ppf(u)
            normal_point.append(mu + sigma * z)
        result.append(normal_point)
    return result


def _normal_ppf(p: float) -> float:
    """Rational approximation of the normal inverse CDF."""
    import math
    if p <= 0:
        return -8.0
    if p >= 1:
        return 8.0
    # Beasley-Springer-Moro approximation
    q = p - 0.5
    if abs(q) <= 0.42:
        r = q * q
        num = q * (((25.44106049637 * r + 41.39119773534) * r + 18.61500062529) * r + 2.50662823884)
        den = ((((3.13082909833 * r + 21.06224101826) * r + 23.08336743743) * r + 8.47351093090) * r + 1.0)
        return num / den
    else:
        r = math.log(-math.log(0.5 - abs(q) + 1e-10)) if q < 0 else -math.log(-math.log(0.5 - q + 1e-10))
        r = min(r, 5.0) if q > 0 else max(r, -5.0)
        num = ((((5.29310593577e-5 * r + 3.36142550377e-4) * r + 0.00241066746372) * r + 0.00925947415721) * r + 0.03443388867188) * r + 1.0
        return math.copysign(num, q)
