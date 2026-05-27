VStack(spacing: 20) { // spacing: 20 giúp các thành phần cách nhau ra
    Image(systemName: "car.fill")
        .font(.system(size: 80)) // Chỉnh icon to lên
        .foregroundStyle(.blue)
    
    VStack(alignment: .center, spacing: 8) {
        Text("Auto 28")
            .font(.largeTitle)
            .fontWeight(.bold)
        
        Text("Hệ thống quản lý xe chuyên nghiệp")
            .font(.subheadline)
            .foregroundColor(.gray)
    }
    
    Spacer() // Đẩy mọi thứ lên trên, nút bấm xuống dưới
    
    Button(action: {
        print("Đã bắt đầu")
    }) {
        Text("Bắt đầu ngay")
            .fontWeight(.semibold)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(12)
    }
}
.padding()

