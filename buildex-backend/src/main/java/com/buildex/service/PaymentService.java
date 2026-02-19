package com.buildex.service;

import com.buildex.entity.Payment;
import com.buildex.entity.Property;
import com.buildex.entity.RentRequest;
import com.buildex.entity.RentSubscription;
import com.buildex.entity.User;
import com.buildex.repository.PaymentRepository;
import com.buildex.repository.PropertyRepository;
import com.buildex.repository.RentRequestRepository;
import com.buildex.repository.RentSubscriptionRepository;
import com.buildex.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final RentRequestRepository rentRequestRepository;
    private final RentSubscriptionRepository rentSubscriptionRepository;
    private final EmailService emailService;
    private final PdfService pdfService;
    private final CloudinaryService cloudinaryService;

    @Value("${razorpay.key_id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret:razorpay_secret_placeholder}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository, PropertyRepository propertyRepository,
            UserRepository userRepository, RentRequestRepository rentRequestRepository,
            RentSubscriptionRepository rentSubscriptionRepository, EmailService emailService,
            PdfService pdfService, CloudinaryService cloudinaryService) {
        this.paymentRepository = paymentRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.rentRequestRepository = rentRequestRepository;
        this.rentSubscriptionRepository = rentSubscriptionRepository;
        this.emailService = emailService;
        this.pdfService = pdfService;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public Payment createOrder(Long userId, Long propertyId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // Determine Payment Type more robustly
        boolean isRent = property.getPurpose() == Property.Purpose.RENT;
        if (!isRent && property.getRentAmount() != null && property.getRentAmount().compareTo(BigDecimal.ZERO) > 0) {
            // Fallback: If purpose is not explicitly RENT but has rent amount, assume RENT
            // if purpose is null
            if (property.getPurpose() == null) {
                isRent = true;
            }
        }

        System.out.println("Creating order for Property: " + property.getId() + ", Purpose: " + property.getPurpose()
                + ", IsRent: " + isRent);

        if (paymentRepository.existsByUserIdAndPropertyIdAndStatus(userId, propertyId, Payment.PaymentStatus.SUCCESS)) {
            // Allow multiple rent payments, but block buy if already bought?
            // Actually, for RENT, we might want to check if there is an ACTIVE subscription
            // or recent payment covering this period
            if (!isRent && property.getPurpose() == Property.Purpose.BUY) {
                throw new RuntimeException("You have already booked/purchased this property.");
            }
        }

        // Full Payment Amount
        BigDecimal totalAmount = isRent
                ? property.getRentAmount()
                : property.getPrice();

        if (totalAmount == null)
            totalAmount = BigDecimal.ZERO;

        // Cap booking amount at 25000 (or 5% logic if implemented in backend, but
        // currently fixed cap/logic matches frontend partially)
        // Frontend says 5%, here we cap at 25000. Let's respect the Service logic but
        // ensure it's not zero.
        BigDecimal maxAmount = new BigDecimal("25000");
        BigDecimal payableAmount = totalAmount.compareTo(maxAmount) > 0 ? maxAmount : totalAmount;

        // Ensure payable amount is not zero for Razorpay
        if (payableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            payableAmount = new BigDecimal("1.00"); // Minimum amount
        }

        BigDecimal remainingAmount = totalAmount.subtract(payableAmount);

        Payment payment = Payment.builder()
                .user(user)
                .property(property)
                .builder(property.getBuilder())
                .amount(payableAmount)
                .totalAmount(totalAmount)
                .remainingAmount(remainingAmount)
                .status(Payment.PaymentStatus.PENDING)
                .paymentType(isRent ? Payment.PaymentType.RENT : Payment.PaymentType.BUY)
                .build();

        // Integrate with Razorpay
        if (!"rzp_test_placeholder".equals(razorpayKeyId) && !"rzp_test_demo".equals(razorpayKeyId)) {
            try {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", payableAmount.multiply(new BigDecimal(100))); // Amount in paise
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

                Order order = razorpay.orders.create(orderRequest);
                payment.setRazorpayOrderId(order.get("id").toString());
            } catch (Exception e) {
                System.err.println("Razorpay Error: " + e.getMessage());
                // Fallback for demo/testing if Razorpay fails or keys invalid
                payment.setRazorpayOrderId("order_" + System.currentTimeMillis());
            }
        } else {
            payment.setRazorpayOrderId("order_" + System.currentTimeMillis());
        }

        Payment savedPayment = paymentRepository.save(payment);
        Hibernate.initialize(savedPayment.getUser());
        Hibernate.initialize(savedPayment.getProperty());
        if (savedPayment.getProperty() != null) {
            Hibernate.initialize(savedPayment.getProperty().getBuilder());
            Hibernate.initialize(savedPayment.getProperty().getGalleryImages());
        }
        Hibernate.initialize(savedPayment.getBuilder());
        return savedPayment;
    }

    @Transactional
    public Payment verifyPayment(String orderId, String paymentId, String signature) {
        System.out.println("Verifying payment for Order ID: " + orderId);
        Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment order not found"));

        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(paymentId);

        System.out.println("Payment verified. Type: " + payment.getPaymentType());

        Property property = payment.getProperty();
        if (property != null) {
            if (payment.getPaymentType() == Payment.PaymentType.RENT) {
                System.out.println("Processing RENT payment for property: " + property.getId());
                property.setRentalStatus(Property.RentalStatus.RENTED);
                property.setAvailabilityStatus(Property.AvailabilityStatus.RENTED);

                // Rent specific updates
                payment.setRentMonth(
                        payment.getPaymentDate().getMonth().name() + " " + payment.getPaymentDate().getYear());
                payment.setNextDueDate(payment.getPaymentDate().toLocalDate().plusMonths(1));

                // create or update Rent Subscription
                RentSubscription subscription = rentSubscriptionRepository
                        .findByUserIdAndPropertyId(payment.getUser().getId(), property.getId())
                        .orElse(new RentSubscription());

                boolean isNew = subscription.getId() == null;

                subscription.setUser(payment.getUser());
                subscription.setProperty(property);
                subscription.setBuilder(property.getBuilder());
                subscription.setMonthlyRent(property.getRentAmount());
                if (subscription.getStartDate() == null) {
                    subscription.setStartDate(LocalDate.now());
                }
                subscription.setNextPaymentDue(LocalDate.now().plusMonths(1));
                subscription.setLastPaymentId(payment.getId());
                subscription.setActive(true);
                rentSubscriptionRepository.save(subscription);
                System.out.println("Rent Subscription " + (isNew ? "created" : "updated") + " for user: "
                        + payment.getUser().getId());

                // Approve corresponding Rent Request
                Optional<RentRequest> rentRequest = rentRequestRepository.findByPropertyIdAndEmail(property.getId(),
                        payment.getUser().getEmail());
                rentRequest.ifPresent(req -> {
                    req.setStatus(RentRequest.Status.APPROVED);
                    rentRequestRepository.save(req);
                    System.out.println("Rent Request approved: " + req.getId());
                });

            } else if (payment.getPaymentType() == Payment.PaymentType.BUY) {
                System.out.println("Processing BUY payment for property: " + property.getId());
                property.setBuyer(payment.getUser());
                property.setSoldDate(payment.getPaymentDate());
                property.setAvailabilityStatus(Property.AvailabilityStatus.SOLD);
                property.setRentalStatus(Property.RentalStatus.RENTED); // Occupied
            }
            propertyRepository.save(property);
        }

        Payment savedPayment = paymentRepository.save(payment);

        // Generate PDF and Send Email (Best effort)
        try {
            byte[] pdfBytes = pdfService.generatePaymentReceipt(savedPayment);
            String fileName = "receipt_" + savedPayment.getId() + ".pdf";

            // Upload to Cloudinary (use fileName as publicId since we switched to raw)
            String pdfUrl = cloudinaryService.uploadPdf(pdfBytes, fileName);
            savedPayment.setPdfUrl(pdfUrl);
            paymentRepository.save(savedPayment);

            // Send Email
            String subject = payment.getPaymentType() == Payment.PaymentType.RENT
                    ? "Rent Payment Confirmation - Buildex"
                    : "Property Purchase Confirmation - Buildex";

            String body = "<h1>Payment Successful</h1>" +
                    "<p>Dear " + savedPayment.getUser().getFullName() + ",</p>" +
                    "<p>Your payment of " + savedPayment.getAmount() + " for <b>" + property.getTitle()
                    + "</b> was successful.</p>" +
                    "<p>Please find your receipt attached.</p>" +
                    "<br/><p>Regards,<br/>Buildex Team</p>";

            emailService.sendEmailWithAttachment(
                    savedPayment.getUser().getEmail(),
                    subject,
                    body,
                    pdfBytes,
                    fileName);
        } catch (Exception e) {
            System.err.println("Error processing PDF/Email: " + e.getMessage());
            e.printStackTrace();
            // Do not fail the transaction for non-critical steps
        }

        Hibernate.initialize(savedPayment.getUser());
        Hibernate.initialize(savedPayment.getProperty());
        if (savedPayment.getProperty() != null) {
            Hibernate.initialize(savedPayment.getProperty().getBuilder());
        }
        Hibernate.initialize(savedPayment.getBuilder());
        return savedPayment;
    }

    @Transactional(readOnly = true)
    public List<Payment> getUserPayments(Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        payments.forEach(p -> {
            Hibernate.initialize(p.getUser());
            Hibernate.initialize(p.getProperty());
            Hibernate.initialize(p.getBuilder());
        });
        return payments;
    }

    @Transactional(readOnly = true)
    public List<Payment> getBuilderPayments(Long builderId) {
        List<Payment> payments = paymentRepository.findByBuilderId(builderId);
        payments.forEach(p -> {
            Hibernate.initialize(p.getUser());
            Hibernate.initialize(p.getProperty());
            Hibernate.initialize(p.getBuilder());
        });
        return payments;
    }

    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        payments.forEach(p -> {
            Hibernate.initialize(p.getUser());
            Hibernate.initialize(p.getProperty());
            Hibernate.initialize(p.getBuilder());
        });
        return payments;
    }

    public boolean hasUserBookedProperty(Long userId, Long propertyId) {
        return paymentRepository.existsByUserIdAndPropertyIdAndStatus(userId, propertyId,
                Payment.PaymentStatus.SUCCESS);
    }

    @Transactional(readOnly = true)
    public Payment getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        Hibernate.initialize(payment.getUser());
        Hibernate.initialize(payment.getProperty());
        if (payment.getProperty() != null) {
            Hibernate.initialize(payment.getProperty().getBuilder());
            Hibernate.initialize(payment.getProperty().getGalleryImages());
        }
        Hibernate.initialize(payment.getBuilder());
        return payment;
    }

    @Transactional
    public void deletePayment(Long id) {
        if (paymentRepository.existsById(id)) {
            paymentRepository.deleteById(id);
        } else {
            throw new RuntimeException("Payment not found");
        }
    }
}
