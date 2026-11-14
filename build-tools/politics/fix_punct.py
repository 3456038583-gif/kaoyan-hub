#!/usr/bin/env python3
"""把政治数据文件字符串内的半角中文标点规范为全角。

只处理双引号字符串字面量的内部，且要求标点两侧是中文（或中文标点），
避免动到 JS 语法逗号和数字/英文里的标点。
"""
import re
import sys
import pathlib

CN = '\u4e00-\u9fa5\u3400-\u4dbf'
CNP = '\u3000-\u303f\uff00-\uffef\u2018-\u201d\u2013\u2014\u2026\u00b7'  # 中文标点区（含引号/破折号/省略号）
CTX = f'[{CN}{CNP}]'

STR_RE = re.compile(r'"(?:[^"\\]|\\.)*"')

RULES = [
    # 中文之间的半角逗号 / 分号 → 全角（顺带吃掉多余空格）
    (re.compile(rf'(?<={CTX})[ \t]*,[ \t]*(?={CTX}|[0-9])'), '，'),
    (re.compile(rf'(?<={CTX})[ \t]*;[ \t]*(?={CTX}|[0-9])'), '；'),
    (re.compile(rf'(?<={CTX})[ \t]*:[ \t]*(?={CTX}|[0-9])'), '：'),
    (re.compile(rf'(?<={CTX})[ \t]*\?'), '？'),
    (re.compile(rf'(?<={CTX})[ \t]*!'), '！'),
    # 中文后的半角句号（排除小数点：前面必须是中文）
    (re.compile(rf'(?<={CTX})\.[ \t]*(?={CTX}|$)'), '。'),
    # 括号：字符串含中文时统一全角
    (re.compile(r'\('), '（'),
    (re.compile(r'\)'), '）'),
]

CN_ANY = re.compile(f'[{CN}]')


def fix_str(text: str) -> str:
    """text 含引号，处理内部内容。"""
    body = text[1:-1]
    # 含中文才动括号
    if not CN_ANY.search(body):
        for pat, rep in RULES[:6]:
            body = pat.sub(rep, body)
        return '"' + body + '"'
    for pat, rep in RULES:
        body = pat.sub(rep, body)
    return '"' + body + '"'


def main(paths):
    total = 0
    for p in paths:
        p = pathlib.Path(p)
        src = p.read_text(encoding='utf-8')
        out = STR_RE.sub(lambda m: fix_str(m.group(0)), src)
        if out != src:
            p.write_text(out, encoding='utf-8')
            changed = sum(1 for a, b in zip(src, out) if a != b)
            print(f'  {p.name}: 修改 {changed} 字符')
            total += 1
        else:
            print(f'  {p.name}: 无变化')
    print(f'共处理 {total} 个文件')


if __name__ == '__main__':
    main(sys.argv[1:])
