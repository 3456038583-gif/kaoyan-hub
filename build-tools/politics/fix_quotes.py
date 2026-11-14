#!/usr/bin/env python3
"""把政治数据里字符串内部的双引号按出现顺序规范成 “ … ” 交替。

PDF 文字层抽取常把左右引号都识别成 ”（或转义成 \"），
只要一个字符串内引号个数是偶数，按位置交替就是正确的。
奇数个的无法自动判定，跳过并列入报告。
"""
import re
import sys
import pathlib

STR_RE = re.compile(r'"(?:[^"\\]|\\.)*"')
QUOTE_RE = re.compile(r'\\"|“|”')


def nest_ok(tokens):
    """原序列是否已是合法的 “ ” 嵌套（不含 ASCII 引号时才有意义）。"""
    depth = 0
    for t in tokens:
        if t == '“':
            depth += 1
        else:
            depth -= 1
            if depth < 0:
                return False
    return depth == 0


def fix(body: str):
    idx = [m.start() for m in QUOTE_RE.finditer(body)]
    if not idx:
        return body, 0, False
    tokens = [body[i] if body[i] != '\\' else '"' for i in idx]
    if len(idx) % 2:
        return body, len(idx), True  # 奇数，跳过
    if '"' not in tokens and nest_ok(tokens):
        return body, 0, False  # 已经正确，不动
    out = []
    prev = 0
    for i, pos in enumerate(idx):
        out.append(body[prev:pos])
        out.append('“' if i % 2 == 0 else '”')
        prev = pos + 1 if body[pos] != '\\' else pos + 2
    out.append(body[prev:])
    return ''.join(out), len(idx), False


def main(paths):
    odd = []
    changed_files = 0
    total_q = 0
    for p in paths:
        p = pathlib.Path(p)
        src = p.read_text(encoding='utf-8')
        stat = {'q': 0}

        def repl(m):
            raw = m.group(0)
            fixed, n, is_odd = fix(raw[1:-1])
            if is_odd:
                odd.append((p.name, raw[1:-1][:90]))
                return raw
            if n:
                stat['q'] += n
            return '"' + fixed + '"'

        out = STR_RE.sub(repl, src)
        if out != src:
            p.write_text(out, encoding='utf-8')
            changed_files += 1
        total_q += stat['q']
        print(f'  {p.name}: 规范 {stat["q"]} 个引号')

    print(f'\n共处理 {changed_files} 个文件，{total_q} 个引号')
    if odd:
        print(f'\n!! {len(odd)} 处引号数为奇数，需人工处理：')
        for f, t in odd:
            print(f'  [{f}] {t}')


if __name__ == '__main__':
    main(sys.argv[1:])
