package com.student.management.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ProfessorTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Professor getProfessorSample1() {
        return new Professor().id(1L);
    }

    public static Professor getProfessorSample2() {
        return new Professor().id(2L);
    }

    public static Professor getProfessorRandomSampleGenerator() {
        return new Professor().id(longCount.incrementAndGet());
    }
}
