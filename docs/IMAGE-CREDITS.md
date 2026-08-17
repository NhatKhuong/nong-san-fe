# Nguồn gốc ảnh

Toàn bộ ảnh trong `public/images/` được tải về bằng `scripts/download-images.mjs`.
Nguồn gồm [Unsplash](https://unsplash.com), [Lorem Picsum](https://picsum.photos), và một số
ảnh **CC0 / public domain** lấy qua [Openverse](https://openverse.org) (rawpixel, Flickr).

Cả ba nhóm đều cho phép dùng miễn phí kể cả cho mục đích thương mại và **không bắt buộc ghi
công**. Bảng dưới đây giữ lại để sau này còn biết ảnh nào lấy từ đâu mà thay thế.

Logo thương hiệu trong `public/images/brands/` là SVG tự sinh, không tải từ đâu cả.

> **Bảng này thiếu các ảnh tải trước Giai đoạn 8.** Cho đến lúc đó, script dựng bảng từ URL
> còn nằm trong mock — mà sau lần chạy đầu mock đã được ghi lại thành đường dẫn local, nên mỗi
> lần chạy lại bảng bị xoá bớt. Nay bảng dựng từ sổ `public/images/.sources.json` nên không
> mất nữa, nhưng phần đã mất thì không khôi phục được vì file này chưa từng được commit.

> **Thay ảnh:** đổi URL trong mock rồi chạy lại script. Script tự tải về **tên file mới**
> (`ten-2.jpg`) chứ không ghi đè, vì file trong `public/` không được Vite gắn hash — giữ
> nguyên tên sẽ khiến người dùng cũ vẫn thấy ảnh cũ trong cache. Sổ `public/images/.sources.json`
> là thứ giúp script phân biệt "thay ảnh" với "chạy lại sau khi bị ngắt".

| File local | Ảnh gốc |
|---|---|
| `/images/about/cau-chuyen-2.jpg` | https://live.staticflickr.com/65535/52407870997_21279cdb4f_b.jpg |
| `/images/about/cau-chuyen.jpg` | https://live.staticflickr.com/7236/7339529514_773ca02f25_b.jpg |
| `/images/about/hero-2.jpg` | https://live.staticflickr.com/2872/10548114875_b19730a9b1_b.jpg |
| `/images/about/hero.jpg` | https://live.staticflickr.com/2883/9303668809_976478ff42_b.jpg |
| `/images/posts/an-sang-co-thuc-su-quan-trong.jpg` | https://images.unsplash.com/photo-1533089860892-a7c6f0a88666 |
| `/images/posts/chat-xo-va-he-tieu-hoa.jpg` | https://images.unsplash.com/photo-1490645935967-10de6ba17061 |
| `/images/posts/chon-thit-bo-dung-cach-2.webp` | https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDIxNi1yYXctYmVlZi1zdGVha3MxLmpwZw.jpg |
| `/images/posts/dam-thuc-vat-va-dam-dong-vat.jpg` | https://images.unsplash.com/photo-1547592180-85f173990554 |
| `/images/posts/doc-nhan-thuc-pham-dung-cach.jpg` | https://live.staticflickr.com/65535/50666455622_ae4444a2a7_b.jpg |
| `/images/posts/hieu-dung-ve-han-su-dung.jpg` | https://images.unsplash.com/photo-1584680226833-0d680d0a0794 |
| `/images/posts/len-thuc-don-tuan-tiet-kiem.jpg` | https://images.unsplash.com/photo-1466637574441-749b8f19452f |
| `/images/posts/nong-trai-doi-tac-tieu-chi-lua-chon.jpg` | https://images.unsplash.com/photo-1523741543316-beb7fc7023d8 |
| `/images/posts/so-che-rau-cu-giu-duong-chat.jpg` | https://images.unsplash.com/photo-1512621776951-a57141f2eefd |
| `/images/posts/thuc-don-eat-clean-7-ngay-2.webp` | https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMxMTY2Mi1pbWFnZS1rd3Z5Z2h5cS5qcGc.jpg |
| `/images/posts/trong-rau-trong-nha-kinh.jpg` | https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8 |
| `/images/posts/tui-vai-va-do-dung-lai-nhieu-lan.jpg` | https://live.staticflickr.com/65535/52326127837_ed40ccaecd_b.jpg |
