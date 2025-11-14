import json
import argparse
from datetime import datetime

# 记账数据文件的路径，需要修改为你的Hexo博客下的实际路径
DATA_FILE = r"F:\Estella's world\source\_data\accounting.json"

def add_record(amount, category, note=""):
    """添加一条新的记账记录"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            records = json.load(f)
    except FileNotFoundError:
        records = []

    new_record = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "amount": amount,
        "category": category,
        "note": note,
        "type": "income" if amount >= 0 else "expense"
    }
    records.append(new_record)

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print("记录添加成功！")

def list_records():
    """列出所有记账记录"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            records = json.load(f)
        for record in records:
            print(record)
    except FileNotFoundError:
        print("尚无记账记录。")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="个人记账命令行工具")
    subparsers = parser.add_subparsers(dest='command')

    # 添加子命令：add
    parser_add = subparsers.add_parser('add', help='添加一条记录')
    parser_add.add_argument('amount', type=float, help='金额，正数为收入，负数为支出')
    parser_add.add_argument('category', type=str, help='类别，如"餐饮"、"薪资"')
    parser_add.add_argument('--note', type=str, default="", help='备注（可选）')

    # 添加子命令：list
    subparsers.add_parser('list', help='列出所有记录')

    args = parser.parse_args()

    if args.command == 'add':
        add_record(args.amount, args.category, args.note)
    elif args.command == 'list':
        list_records()
    else:
        parser.print_help()