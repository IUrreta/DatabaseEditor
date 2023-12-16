import argparse
import os
import zlib
import struct
import mmap

CHNUK1_NAME = "chunk1"
MAIN_DB_NAME = "main.db"
BACKUP_DB_NAME = "backup1.db"
BACKUP_DB2_NAME = "backup2.db"


def create_db(fname, decompressed_db, _start, _end):
    with open(fname, 'wb') as f:
        f.write(decompressed_db[_start:_end])


def get_db_mmap(path):
    if not os.path.exists(path):
        return b''

    with open(path, 'rb') as f:
        return mmap.mmap(f.fileno(), length=0, access=mmap.ACCESS_READ)


def pack_databases(_dir):
    result = list()

    mmaps = [
        get_db_mmap(os.path.join(_dir, MAIN_DB_NAME)),
        get_db_mmap(os.path.join(_dir, BACKUP_DB_NAME)),
        get_db_mmap(os.path.join(_dir, BACKUP_DB2_NAME))
    ]

    to_zlib = b''

    db_sizes = list()
    for mmap in mmaps:
        _sz = len(mmap)
        db_sizes.append(_sz)
        if _sz == 0:
            continue

        to_zlib += mmap.read()
    compressed = zlib.compress(to_zlib)
    result.append(struct.pack("I", len(compressed)))

    for db_size in db_sizes:
        result.append(struct.pack("I", db_size))
    result.append(compressed)
    return result


def do_pack(from_folder, to_file):
    chunk1_path = os.path.join(from_folder, CHNUK1_NAME)
    if not os.path.exists(chunk1_path):
        print(f"Can't find {chunk1_path}")
        return

    new_file_content = b''
    with open(chunk1_path, 'rb') as f:
        new_file_content += f.read()

    for _bytes in pack_databases(from_folder):
        new_file_content += _bytes

    with open(to_file, 'wb') as f:
        f.write(new_file_content)

def do_unpack(from_file, to_folder):
    with open(from_file, 'rb') as f:
        mm = mmap.mmap(f.fileno(), length=0, access=mmap.ACCESS_READ)

    # None None just before the packed DB Section.
    none_none_sig = b'\x00\x05\x00\x00\x00\x4E\x6F\x6E\x65\x00\x05\x00\x00\x00\x4E\x6F\x6E\x65\x00\x00\x00\x00\x00'

    db_section_off = mm.find(none_none_sig) + len(none_none_sig)
    #db_section_off += 4  # Unk 4 Bytes

    # Part of the file that we ignore as it's not database
    # But we need it later to "pack" new save
    with open(os.path.join(to_folder, CHNUK1_NAME), 'wb') as f:
        f.write(mm.read(db_section_off))

    zlib_sz = struct.unpack('i', mm.read(4))[0]

    databases = {
        os.path.join(to_folder, MAIN_DB_NAME): struct.unpack('i', mm.read(4))[0],
        os.path.join(to_folder, BACKUP_DB_NAME): struct.unpack('i', mm.read(4))[0],
        os.path.join(to_folder, BACKUP_DB2_NAME): struct.unpack('i', mm.read(4))[0]
    }

    decompressed_dbs = zlib.decompress(mm.read())

    _start = 0
    for dump_name, db_size in databases.items():
        # print(f'{dump_name}:{db_size}')
        if db_size == 0:
            break
        create_db(dump_name, decompressed_dbs, _start, _start+db_size)
        _start += db_size


def process_unpack(input_file, result_dir):
    if not os.path.exists(input_file):
        print(f"Can't find {input_file}")
        return

    if not os.path.exists(result_dir):
        os.makedirs(result_dir)

    do_unpack(input_file, result_dir)


def process_repack(input_dir, result_file):
    do_pack(input_dir, result_file)
