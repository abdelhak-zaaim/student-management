package com.student.management.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class StudentGroupTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static StudentGroup getStudentGroupSample1() {
        return new StudentGroup().id(1L).name("name1").description("description1");
    }

    public static StudentGroup getStudentGroupSample2() {
        return new StudentGroup().id(2L).name("name2").description("description2");
    }

    public static StudentGroup getStudentGroupRandomSampleGenerator() {
        return new StudentGroup()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString());
    }
}
